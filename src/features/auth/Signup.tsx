import { useNavigate } from 'react-router-dom';

export function Signup() {
    const navigate = useNavigate();

    return (
        <div>
          <h1>회원가입</h1>
          <button onClick={() => navigate('/home')}>가입 완료 (테스트용)</button>
        </div>
    )
}