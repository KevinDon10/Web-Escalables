export interface User {
  id: string,
  name: string,
  username: string,
  email: string,
  image: string,
}

export type NewUser = Omit<User, 'id'>;

