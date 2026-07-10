import { WebSocket } from "ws";
const users = new Map<WebSocket, string>();
export const addUser = (
socket: WebSocket, username: string
):void =>{
    users.set(socket, username);
      console.log(`✅ ${username} ajouté`);

}
export const removeUser = (socket: WebSocket):void => {
    const username = users.get(socket);
    if(username){
        users.delete(socket);
        console.log(`❌ ${username} is deleted`);
    }
    
};
export const getUser = (socket: WebSocket): string | undefined => {
    return users.get(socket)
}
export const getAllUsers = (): string[] => {
    return [...users.values()];
}
export const getOnlineCount = (): number => {
  return users.size;
};