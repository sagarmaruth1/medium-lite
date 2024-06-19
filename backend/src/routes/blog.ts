import { Hono } from "hono"
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { verify } from 'hono/jwt';
import { createBlogInput, updateBlogInput } from "@sagarmaruthi/medium-common";

export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	},
	Variables: {
		userId: string;
	}
}>();

blogRouter.use("/*", async (c, next) => {

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	const authHeader = c.req.header("authorization") || "";
	const user = await verify(authHeader, c.env.JWT_SECRET);

	if (user) {
		c.set("userId", String(user.id));
		await next();
	} else {
		return c.json({
			msg: "You are not logged in"
		});
	}
});

blogRouter.post("", async (c) => {

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	
	const body = await c.req.json();
	const authorId = c.get("userId");
	const parsedBody = createBlogInput.safeParse(body);
	if( !parsedBody.success ) {
		c.status(411);
		return c.json({
			message: "Inputs not correct",
			errors: parsedBody.error.errors,
		});
	}
	
	const blog = await prisma.blog.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: Number(authorId)
		}
	});
	
	return c.json({
		id: blog.id
	});
	
});

blogRouter.put("", async (c) => {

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	
	const body = await c.req.json();
	const { success } = updateBlogInput.safeParse(body);
	if( !success ) {
		c.status(411);
		return c.json({
			message: "Inputs not correct"
		});
	}

	const blog = await prisma.blog.update({
		where: {
			id: body.id
		},
		data: {
			title: body.title,
			content: body.content,
		}
	});
	
	return c.json({
		id: blog.id
	});

});

blogRouter.get("bulk", async (c) => {
	
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	
	const blogs = await prisma.blog.findMany();
	
	return c.json({
		blogs
	})
	
});

blogRouter.get("/:id", async (c) => {

	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	
	const id = c.req.param("id");
	
	const blog = await prisma.blog.findFirst({
		where: {
			id: Number(id)
		}
	});
	
	return c.json({
		blog
	});

});