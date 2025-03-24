from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .auth_handler import decode_token
from app.models.user import UserRole

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)
        
    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            
            token_data = self.verify_jwt(credentials.credentials)
            if not token_data:
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
                
            return token_data
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")
            
    def verify_jwt(self, token: str):
        # Verify token by decoding it and returning TokenData object
        return decode_token(token)

# Role-based dependencies
def admin_required(token_data = Depends(JWTBearer())):
    if token_data.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this resource. Admin role required."
        )
    return token_data

def teacher_required(token_data = Depends(JWTBearer())):
    if token_data.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this resource. Teacher role required."
        )
    return token_data

def student_or_above_required(token_data = Depends(JWTBearer())):
    if token_data.role not in [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this resource."
        )
    return token_data