
export default (users: any[]) =>  users.map( (user)=> {
    let { password, ...userWithoutPassword } = user;  
    //! To avoid sending the password to the frontend
    return ({ ...userWithoutPassword })
  })