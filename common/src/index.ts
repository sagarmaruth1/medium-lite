import { z } from "zod";

// Signup
export const signupInput = z.object({
	username: z.string(),
	password: z.string().min(3),
	name: z.string().optional()
});

// Signin
export const signinInput = z.object({
	username: z.string(),
	password: z.string().min(3),
	name: z.string().optional()
});

// Create Blog
export const createBlogInput = z.object({
	title: z.string(),
	content: z.string()
})

// Update Blog
export const updateBlogInput = z.object({
	title: z.string(),
	content: z.string(),
	id: z.number()
})

// These types will be used by frontend
export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type CreateBlogInput = z.infer<typeof createBlogInput>
export type UpdateBlogInput = z.infer<typeof updateBlogInput>