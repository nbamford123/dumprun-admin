// src/services/auth.service.ts
import { Amplify } from 'aws-amplify';
import {
	fetchAuthSession,
	getCurrentUser,
	signIn,
	signOut,
	type AuthSession,
	type SignInOutput,
} from 'aws-amplify/auth';

// Define error type for proper error handling
interface CognitoError extends Error {
	code?: string;
}

export interface AuthConfig {
	region: string;
	userPoolId: string;
	userPoolWebClientId: string;
	cookieStorage?: {
		domain: string;
		path: string;
		secure: boolean;
	};
}

// Handle AWS authentication using amplify
export class AuthService {
	private static instance: AuthService;
	private cachedSession: AuthSession | null = null;

	private constructor() {
		// Private constructor for singleton
	}

	static getInstance(): AuthService {
		if (!AuthService.instance) {
			AuthService.instance = new AuthService();
		}
		return AuthService.instance;
	}

	configure(config: AuthConfig) {
		console.log(config)
		Amplify.configure({
			API: {
				REST: {
					DumpRunApi: {
						endpoint: import.meta.env.VITE_AWS_GATEWAY_API_BASE_PATH || '',
						region: import.meta.env.VITE_AWS_REGION,
					},
				},
			},
			Auth: {
				Cognito: {
					userPoolId: config.userPoolId,
					userPoolClientId: config.userPoolWebClientId,
					loginWith: {
						email: true,
					},
				},
			},
		});
	}

	async getAuthSession(): Promise<AuthSession> {
		if (!this.cachedSession) {
			this.cachedSession = await fetchAuthSession();
		}
		return this.cachedSession;
	}

	async signIn(username: string, password: string): Promise<SignInOutput> {
		// try {
		const signInResult = await signIn({
			username,
			password,
		});
		// Cache the session right after successful sign in
		this.cachedSession = await fetchAuthSession();
		return signInResult;
		// } catch (error) {
		// 	throw this.handleError(error as CognitoError);
		// }
	}

	async signOut() {
		try {
			await signOut();
			this.cachedSession = null; // Clear cached session on sign out
		} catch (error) {
			throw this.handleError(error as CognitoError);
		}
	}

	async getCurrentUser() {
		try {
			return await getCurrentUser();
		} catch {
			return null;
		}
	}

	async isAuthenticated(): Promise<boolean> {
		try {
			const user = await getCurrentUser();
			return !!user;
		} catch {
			return false;
		}
	}

	private handleError(error: CognitoError): Error {
		console.log(error);
		if (!error.code) {
			return new Error('An unknown error occurred');
		}

		switch (error.code) {
			case 'UserNotConfirmedException':
				return new Error('Please confirm your email address');
			case 'NotAuthorizedException':
				return new Error('Invalid credentials');
			case 'UserNotFoundException':
				return new Error('User not found');
			case 'PasswordResetRequiredException':
				return new Error('Password reset required');
			case 'TooManyRequestsException':
				return new Error('Too many attempts. Please try again later');
			default:
				return new Error(error.message || 'An unknown error occurred');
		}
	}
}

export const authService = AuthService.getInstance();
