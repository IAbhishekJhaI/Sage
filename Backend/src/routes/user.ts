import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { signupInput, signinInput } from "@mysticalbun/sage-common"

export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
        JWT_SECRET: string,
	}
    Variables: {
        userId: string
    }
}>();

userRouter.use('/api/v1/blog/*', async(c, next) => {
  const jwt = c.req.header('Authorization');
  if(!jwt){
    c.status(401);
    return c.json({error: "unauthorized"});
  }

  //Bearer Token logic
  const token = jwt.split('')[1];

  const payload = await verify(token, c.env.JWT_SECRET);
  if(!payload){
    c.status(401);
    return c.json({error: "unauthorized"});
    }
  c.set('userId', String(payload.id));
  await next()
})


userRouter.post('/signin', async (c)=>{
  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
        message: "invalid input"
    });
}
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try{
    const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    }
  });

  if(!user){
    c.status(403);
    return c.json({error: "user not found"});
  }

  const jwt = await sign({id: user.id}, c.env.JWT_SECRET);
  return c.json({jwt});
  } catch (e) {
    c.status(411);
    return c.json({error: "Invalid: error signing in"});
  }
})

userRouter.post('/signup', async (c) => {
  const body =await c.req.json();
  const { success } = signupInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
        message: "invalid input"
    });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try{
    const user = await prisma.user.create({
      data:{
        email: body.email,
        password: body.password,
        name: body.name
      },
    });
    const jwt = await sign({id: user.id}, c.env.JWT_SECRET);
    return c.json({jwt});
  } catch(e) {
    c.status(403);
    return c.json({error: "error while signing up"});
  }
})
