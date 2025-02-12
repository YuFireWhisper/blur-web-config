import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { ConfigBlock } from "./types";
import { parseRawConfig, RawConfig } from "./parser";
import { BASE_URL_PATH } from "../App";

interface UpdateConfigRequest {
  path: string;
  new_value: unknown;
}

interface AddBlockRequest {
  parent_path: string;
  block_name: string;
}

interface DeleteBlockRequest {
  block_path: string;
}

export class ConfigAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
  ) {
    super(message);
    this.name = "ConfigAPIError";
  }
}

export class ConfigAPIClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private lastRequestTime: number = 0;
  private readonly minRequestInterval: number = 1000; // 每次請求間至少間隔1秒

  constructor(
    maxRetries: number = 3,
    timeout: number = 15000,
    retryDelay: number = 1000, // 固定重試時間1秒
  ) {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL_PATH,
      timeout,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;

    // 添加響應攔截器，這裡只更新 lastRequestTime，不再控制 isRequestInProgress
    this.axiosInstance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleInterceptorError.bind(this),
    );
  }

  /**
   * 處理響應數據：更新上次請求時間
   */
  private handleResponse(response: AxiosResponse) {
    this.lastRequestTime = Date.now();
    return response;
  }

  /**
   * 處理攔截器錯誤
   */
  private handleInterceptorError(error: AxiosError) {
    return Promise.reject(error);
  }

  /**
   * 確保兩次請求之間至少間隔 minRequestInterval 毫秒
   */
  private async ensureRequestInterval(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest),
      );
    }
  }

  /**
   * 獲取完整配置
   */
  async getConfig(): Promise<ConfigBlock> {
    try {
      const response = await this.executeWithRetry(() =>
        this.axiosInstance.get<RawConfig>("/json"),
      );
      return parseRawConfig(response.data);
    } catch (error) {
      throw this.handleApiError(error, "Failed to get config", "/json");
    }
  }

  /**
   * 更新配置值
   */
  async updateConfig(path: string, newValue: unknown): Promise<void> {
    try {
      console.log("updateConfig", path, newValue);
      const payload: UpdateConfigRequest = { path, new_value: newValue };
      await this.executeWithRetry(() =>
        this.axiosInstance.post("/update", payload),
      );
    } catch (error) {
      throw this.handleApiError(error, "Failed to update config", "/update");
    }
  }

  /**
   * 添加新的配置塊
   */
  async addBlock(parentPath: string, blockName: string): Promise<void> {
    try {
      const payload: AddBlockRequest = {
        parent_path: parentPath,
        block_name: blockName,
      };
      await this.executeWithRetry(() =>
        this.axiosInstance.post("/add_block", payload),
      );
    } catch (error) {
      throw this.handleApiError(error, "Failed to add block", "/add_block");
    }
  }

  /**
   * 刪除配置塊
   */
  async deleteBlock(blockPath: string): Promise<void> {
    try {
      const payload: DeleteBlockRequest = { block_path: blockPath };
      await this.executeWithRetry(() =>
        this.axiosInstance.post("/delete_block", payload),
      );
    } catch (error) {
      throw this.handleApiError(
        error,
        "Failed to delete block",
        "/delete_block",
      );
    }
  }

  /**
   * 執行請求並在失敗時重試
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount: number = 0,
  ): Promise<T> {
    // 確保請求間隔
    await this.ensureRequestInterval();

    try {
      const result = await operation();
      this.lastRequestTime = Date.now();
      return result;
    } catch (error) {
      if (
        retryCount < this.maxRetries &&
        error instanceof AxiosError &&
        this.shouldRetry(error)
      ) {
        console.log(
          `Retrying request (attempt ${retryCount + 1}/${this.maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.executeWithRetry(operation, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * 判斷是否應重試
   */
  private shouldRetry(error: AxiosError): boolean {
    if (error.response) {
      const status = error.response.status;
      return (
        status >= 500 || // 服務器錯誤
        status === 429 || // 速率限制
        status === 408 // 請求超時
      );
    }
    if (error.code) {
      return [
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNABORTED",
        "ENETUNREACH",
        "ENOTFOUND",
      ].includes(error.code);
    }
    return false;
  }

  /**
   * 統一處理 API 錯誤
   */
  private handleApiError(
    error: unknown,
    message: string,
    endpoint: string,
  ): ConfigAPIError {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const errorResponse = error.response?.data;
      const errorMessage =
        typeof errorResponse === "object" && errorResponse !== null
          ? JSON.stringify(errorResponse)
          : error.message;

      console.error(`API Error: ${message}`, {
        statusCode,
        endpoint,
        errorMessage,
        response: error.response?.data,
      });

      return new ConfigAPIError(
        `${message}: ${errorMessage}`,
        statusCode,
        endpoint,
      );
    }
    return new ConfigAPIError(
      `${message}: ${error instanceof Error ? error.message : "Unknown error"}`,
      undefined,
      endpoint,
    );
  }
}
