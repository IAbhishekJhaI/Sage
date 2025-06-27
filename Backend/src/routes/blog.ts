import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'

export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
        JWT_SECRET: string,
	}
    Variables: {
        userId: number;
    }
}>();

blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    try{
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", Number(user.id));
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch(e){
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
});

//TODO: add pagination
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.blog.findMany();

    return c.json({
        blogs
    })
})

//Create a blog
blogRouter.post('/', async (c)=>{
  const body = await c.req.json();
  const authorId =  c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blog = await prisma.blog.create({
    data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId)
    }
  })

  return c.json({
    id: blog.id
  })
})

//Update a blog
blogRouter.put('/', async (c)=>{
  const body = await c.req.json();

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blog = await prisma.blog.update({
    where: {
        id: body.id
    },
    data: {
        title: body.title,
        content: body.content,
    }
  })
  return c.json({
    id: blog.id
  })
})


blogRouter.get('/:id', async (c)=> {
    const id=c.req.param("id"); 
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  try{
    const blog = await prisma.blog.findFirst({
      where: {
        id: Number(id)
        },
    })

    return c.json({
        blog
    })
    } catch(e) {
        c.status(411);
        return c.json({
            message: "Error while fetching blog post"
        });
    }
})

