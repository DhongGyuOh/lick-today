//server-only는 이 파일이 클라이언트 컴포넌트에서 import되는 것을 방지해줌
import "server-only";
// bcryptjs는 비밀번호 해싱 및 검증을 위한 라이브러리
import bcrypt from "bcryptjs";

// 비밀번호 해싱
export async function hashpassword(passward: string){
    return bcrypt.hash(passward, 12); // 12는 saltRounds로, 해싱 과정에서 사용되는 salt의 복잡도를 나타냄
}

// 입력 비밀번호와 DB 해시 비교
export async function verifyPassword(
  password: string,
  hashedPassword: string
) 
{
  return bcrypt.compare(password, hashedPassword);
}
