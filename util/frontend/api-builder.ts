const API_BASE_URL = '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
}

class ApiBuilder {
    private url: string;
    private options: RequestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    constructor(endpoint: string) {
        this.url = `${API_BASE_URL}/${endpoint}`;
    }

    method(method: HttpMethod): ApiBuilder {
        this.options.method = method;
        return this;
    }

    body(data: any): ApiBuilder {
        this.options.body = JSON.stringify(data);
        return this;
    }

    addHeader(key: string, value: string): ApiBuilder {
        this.options.headers = { ...this.options.headers, [key]: value };
        return this;
    }

    async send<T>(): Promise<T> {
        const response = await fetch(this.url, this.options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
}

export const apiBuilder = (endpoint: string) => new ApiBuilder(endpoint);