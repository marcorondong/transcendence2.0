export const setCookieOpt = {
	path: "/",
	httpOnly: true,
	secure: true,
	signed: true,
	sameSite: "strict" as const,
	maxAge: 60 * 60,
};

export const jwtSignOpt = {
	expiresIn: "1h",
	// issuer: "auth_api_sign",
	// iss: "auth_api",
	// audience: "users",
	// aud: "users",
	// jwtid: "auth_api",
	// keyid: "auth_api",
	// notBefore: '10s',
	// subject: "auth_api",
	// algorithm: "HS256",
	// customClaim: "customClaimValue",
};

export const clearCookieOpt = {
	path: "/",
};
