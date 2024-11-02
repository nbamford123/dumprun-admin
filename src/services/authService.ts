// src/services/auth.service.ts
import { Amplify } from 'aws-amplify';
import {
	getCurrentUser,
	signIn,
	signOut,
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

export class AuthService {
	private static instance: AuthService;

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
		Amplify.configure({
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

	async signIn(username: string, password: string): Promise<SignInOutput> {
		// try {
			const signInResult = await signIn({
				username,
				password,
			});
			return signInResult;
		// } catch (error) {
		// 	throw this.handleError(error as CognitoError);
		// }
	}

	async signOut() {
		try {
			await signOut();
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
		console.log(error)
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
