import { Link, useNavigate } from 'react-router-dom';

export function Login() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>로그인</h1>
            <button onClick={() => navigate('/home')}>로그인 (테스트용)</button>
            <div><Link to="/find-account">아이디/비밀번호 찾기</Link></div>
            <div><Link to="/signup">회원가입</Link></div>
        </div>
    )
}