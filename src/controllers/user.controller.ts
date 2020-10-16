import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { UserService } from '../services/user.service' 
import { wrap } from '../middlewares'
import noListPass from '../utils/userListNoPassword'
import noPass from '../utils/userNoPassword'
import ApiError from '../utils/apiError'
import pick from '../utils/pick'

export const UserController = {

  //! POST: Create users function
  //! Must be called with all the required params in the body of the post method
  //! i.e:  http://localhost:8000/
  createUser: wrap(async (req: Request, res: Response) => 
  {
    const user = await UserService.createUser(req.body);
    res.status(httpStatus.CREATED).send(user)
  }),

  //! Get users function
  //! it could be called with no params, or with a "search" param to filter just the users that matches
  //! same with the page attribute, it is not required, and the default is 1
  //! i.e:  http://localhost:8000/user?search=Alice2&&page=2
  getUsers: wrap(async (req: Request, res: Response) => {

    const filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'page']);

    const result = (Object.keys(req.query).length) 
                        ? await UserService.queryUsers(filter, options)
                        : await UserService.findAll(req.query)

    const parsed = Object.values(result);

    res.status(httpStatus.OK).send(noListPass(parsed));
  }),

  //! Get a user by id
  //! it could be called with a single param with the uuid of the user
  //! i.e:  http://localhost:8000/F43ac3ec-6029-4360-b249d-9742ae972c4a
  getUser: wrap(async (req: Request, res: Response) => {
    const { id } = req.params    
    const user = await UserService.getUserById(id);
    if (!user){
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    } else {
      res.status(httpStatus.OK).send(noPass(user))
    };
  }),

  updateUser: wrap(async (req: Request, res: Response) => {
    const { id } = req.params
    const user = await UserService.updateUserById(id, req.body);
    res.send(noPass(user));
  }),

  deleteUser: wrap(async (req: Request, res: Response) => {
    await UserService.deleteUserById(req.params.userId);
    res.status(httpStatus.NO_CONTENT).send();
  }),
}