import { toast } from "@/hooks/use-toast";

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL = '/api', timeout = 10000) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  private async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout
    } = options;

    const url = endpoint.startsWith('/') ? endpoint : `${this.baseURL}/${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
        credentials: 'include',
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = response.statusText;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(`${response.status}: ${errorMessage}`);
      }

      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as any;
      }

      return { data };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Request timeout');
          console.error('API request timeout:', url);
          return { error: 'Request timeout' };
        }
        
        console.error('API request error:', error.message);
        return { error: error.message };
      }

      console.error('Unknown API error:', error);
      return { error: 'Unknown error occurred' };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create and export API client instance
export const api = new ApiClient();

// Utility functions for common operations
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    if (response.error) {
      toast({
        title: "로그인 실패",
        description: response.error,
        variant: "destructive"
      });
    }
    return response;
  },

  register: async (userData: { username: string; email: string; password: string; name: string; age: number; location: string }) => {
    const response = await api.post('/auth/register', userData);
    if (response.error) {
      toast({
        title: "회원가입 실패",
        description: response.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "회원가입 성공",
        description: "LUNE에 오신 것을 환영합니다!"
      });
    }
    return response;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    if (response.error) {
      toast({
        title: "로그아웃 실패",
        description: response.error,
        variant: "destructive"
      });
    }
    return response;
  }
};

export const profileApi = {
  getProfile: async (userId: string) => {
    return api.get(`/user/${userId}`);
  },

  updateProfile: async (userId: string, profileData: any) => {
    const response = await api.put(`/profile/${userId}`, profileData);
    if (response.error) {
      toast({
        title: "프로필 업데이트 실패",
        description: response.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "프로필 업데이트 완료",
        description: "변경사항이 저장되었습니다."
      });
    }
    return response;
  },

  completeOnboarding: async (userId: string, answers: any) => {
    const response = await api.post(`/onboarding/${userId}`, answers);
    if (response.error) {
      toast({
        title: "온보딩 실패",
        description: response.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "온보딩 완료",
        description: "프로필이 성공적으로 생성되었습니다!"
      });
    }
    return response;
  }
};

export const matchingApi = {
  getMatches: async (userId: string) => {
    return api.get(`/matches/${userId}`);
  },

  likeUser: async (matchId: string) => {
    const response = await api.post(`/matches/${matchId}/like`);
    if (response.error) {
      toast({
        title: "오류 발생",
        description: response.error,
        variant: "destructive"
      });
    }
    return response;
  },

  getFirstMessageTemplates: async (viewerUserId: string, targetUserId: string) => {
    return api.post('/ai/first-messages', { viewerUserId, targetUserId });
  },

  generateActivityInvite: async (sharedInterest: string, city: string) => {
    return api.post('/ai/activity-invite', { sharedInterest, city });
  }
};

export const messagingApi = {
  getConversations: async (userId: string) => {
    return api.get(`/conversations/${userId}`);
  },

  getMessages: async (conversationId: string) => {
    return api.get(`/messages/${conversationId}`);
  },

  sendMessage: async (messageData: { conversationId: string; senderId: string; content: string }) => {
    const response = await api.post('/messages', messageData);
    if (response.error) {
      toast({
        title: "메시지 전송 실패",
        description: response.error,
        variant: "destructive"
      });
    }
    return response;
  },

  getConversationCoach: async (conversationId: string, userIntent?: string) => {
    return api.post('/ai/conversation-coach', { conversationId, userIntent });
  }
};

export const feedbackApi = {
  submitFeedback: async (userId: string, feedbackData: any) => {
    const response = await api.post(`/feedback/${userId}`, feedbackData);
    if (response.error) {
      toast({
        title: "피드백 제출 실패",
        description: response.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "피드백 제출 완료",
        description: "소중한 피드백 감사합니다."
      });
    }
    return response;
  },

  getFeedback: async (userId: string) => {
    return api.get(`/feedback/${userId}`);
  }
};

export const safetyApi = {
  reportUser: async (reportData: { reporterId: string; reportedUserId: string; reportType: string; description?: string }) => {
    const response = await api.post('/reports', reportData);
    if (response.error) {
      toast({
        title: "신고 접수 실패",
        description: response.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "신고가 접수되었습니다",
        description: "검토 후 적절한 조치를 취하겠습니다."
      });
    }
    return response;
  },

  getProfileSuggestions: async (userId: string) => {
    return api.post('/ai/profile-suggestions', { userId });
  }
};

// Export default API client
export default api;
