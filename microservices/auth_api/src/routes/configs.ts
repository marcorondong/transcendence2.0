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
};

export const clearCookieOpt = {
	path: "/",
};
