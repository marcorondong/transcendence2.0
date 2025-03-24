import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getItemsOpts, getItemOpts, postItemOpts, deleteItemOpts, updateItemOpts } from '../opts/opts';
import { $ref } from '../userSchemas/userSchemas';



export async function login(
	req: FastifyRequest,
	reply: FastifyReply,
  ) {
// 	const { email, password } = req.body


// 	  /*
//    MAKE SURE TO VALIDATE (according to you needs) user data
//    before performing the db query
//   */
//    const user = await prisma.user.findUnique({ where: { email: email } })
//    const isMatch = user && (await bcrypt.compare(password, user.password))
//    if (!user || !isMatch) {
// 	 return reply.code(401).send({
// 	   message: 'Invalid email or password',
// 	 })
//    }
   const payload = {
	 id: "user.id",
	 email: "user.email",
	 name: "user.name",
   }
   const token = req.jwt.sign(payload)
   console.log('token', token)
   reply.setCookie('access_token', token, {
	 path: '/',
	 httpOnly: true,
	//  secure: true, // send cookie only over https
   })
   return { accessToken: token }
 }

 export async function logout(req: FastifyRequest, reply: FastifyReply) {
	reply.clearCookie('access_token')
	return reply.send({ message: 'Logout successful' })
}


export function itemRoutes(fastifyItems: FastifyInstance, options: any, done: any) {
    // Get all items
    fastifyItems.get('/items', 	getItemsOpts(fastifyItems) );
    // Get a single item
    fastifyItems.get('/items/:id', getItemOpts);
    // Add a new item
    fastifyItems.post('/items', postItemOpts);
    // Delete
    fastifyItems.delete('/items/:id', deleteItemOpts);
    // Update
    fastifyItems.put('/items/:id', updateItemOpts);

	fastifyItems.post(
		'/login',
		{
		  schema: {
			body: $ref('loginSchema'),
			response: {
			  201: $ref('loginResponseSchema'),
			},
		  },
		},
		login,
	  )

	  fastifyItems.delete('/logout', { preHandler: [fastifyItems.authenticate] }, logout)

    done();
}