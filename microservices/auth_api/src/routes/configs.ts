export const setCookieOpt = {
	path: "/",
	httpOnly: true,
	secure: true,
	signed: true,
	sameSite: "strict" as const,
	maxAge: 5 * 60 * 60,
};

export const jwtSignOpt = {
	expiresIn: "5h",
};

export const clearCookieOpt = {
	path: "/",
};
