import { PrismaClient, User, UserOrderByInput, UserUpdateInput } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import httpStatus from 'http-status'
import ApiError from '../utils/apiError';
import config from '../config/config'

const prisma = new PrismaClient({});
  
export const UserService = {
  
  //! Create a new user: Body: At least all the mandatry fields for the creation of a user
  createUser: async ( userBody: User ) => {

    const { name, email, username } = userBody

    // Data transforamtion before calling the prisma service    
    let user: User | null
    const cryptPassword = bcrypt.hashSync(userBody.password, 8)
    
    const data =  { name, email, username, password: cryptPassword };
              
    //required fields
    if (!(username && name && email)){
      throw new ApiError( httpStatus.BAD_REQUEST, 'Must provide all the required fields' )
    }
            
    //Check if the username is taken
    user = await prisma.user.findOne({ where: { username } })
    if (user) {
      throw new ApiError( httpStatus.CONFLICT, 'A user by that username already exists' )
    }
    //Check if the email is taken              
    user = await prisma.user.findOne({ where: { email } })
    if (user){
      throw new ApiError( httpStatus.CONFLICT, 'A user by that email already exists' )
    }  

    user = await prisma.user.create({ data })
    // console.log('[UserService] prisma.user', user)
    
    let { password, ...userWithoutPassword } = user;
  
    // To avoid sending the password to the frontend
    return userWithoutPassword
  },

  //! Get by email users
  getUserByEmail: async (email: string) => {
    const user = await prisma.user.findOne({ where: { email: email }, });    
    return user
  },

  //! Get by email users
  getUserByUsername: async (username: string) => {
    let user: User | null
    user = await prisma.user.findOne({ where: { username: username }, });
    return user;
  },


  //! Get by id users
  getUserById: async (id: string) => {
    return await prisma.user.findOne({ where: { id }, })    
  },


  //! Find all users
  findAll: async (query: any) => {
    //Normal pagination: (Page 1) includes items from [0..9]
    const { page }: { page?: string } = query
    const pageRequested = (page && !Number.isNaN(page)) ? Number(page) : 1
    const resPerPage = (config.pagination && !Number.isNaN(config.pagination)) ? Number(config.pagination) : 10  
    const start = (pageRequested-1)*resPerPage
    let users = await prisma.user.findMany({skip: start, take: resPerPage});
    return { ...users }
  },

  //! Find a user by query 
  //! For more details on how to call this funciton https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/sorting#sort-user-by-email-field
  queryUsers: async (filter: any, options: any) => {
    const { page, orderBy }: { page?: string, orderBy?: UserOrderByInput } = options
    const pageRequested = (page && !Number.isNaN(page)) ? Number(page) : 1 
    const resPerPage = (config.pagination && !Number.isNaN(config.pagination)) ? Number(config.pagination) : 10  
    const start = (pageRequested-1)*resPerPage

    const { name, role }: { name?: string, role?: string } = filter
    const containsName = { contains: name }
    const containsRole = { contains: role }

    const OR = [{ name: containsName },
                { email: containsRole } ]
    
    let users: UserUpdateInput[] = []

    const usersList = await prisma.user.findMany({ orderBy, skip: start, take: resPerPage, where: { OR } })
    
    usersList.forEach( (u) => {
      let { password, ...userWithoutPassword } = u;
      users.push(userWithoutPassword)
    })

    return users;
  },

  //! Update a user by id
  updateUserById: async (userid: string, update: UserUpdateInput) => {
    
    const data =  update; 
    const where = { id: userid }

    if (!userid) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Must provide category and content')
    }
    let user: User | null

    user = await prisma.user.findOne({ where })

    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User with that id does not exist')
    }

    await prisma.user.update({ where, data: data })

    return user;
  },

  //! Delete a user by id
  deleteUserById: async (userid: string) => {
    const where = { id: userid }

    let user: User | null

    user = await prisma.user.delete({ where })

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No users with that ID' )
    }
    return user;
  },
}