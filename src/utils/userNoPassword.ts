
export default (user: any) => {
    let { password, ...userWithoutPassword } = user;  
    //! To avoid sending the password to the frontend
    return ({ ...userWithoutPassword })
  }