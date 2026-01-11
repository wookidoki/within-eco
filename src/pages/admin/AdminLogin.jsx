import { useState } from 'react'
import styled from 'styled-components'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
`

const LoginBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
`

const Title = styled.h1`
  color: #fff;
  text-align: center;
  margin-bottom: 8px;
  font-size: 24px;
`

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-bottom: 32px;
  font-size: 14px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4CAF50;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const Button = styled.button`
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border: none;
  border-radius: 8px;
  padding: 14px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  border-radius: 8px;
  padding: 12px;
  color: #f44336;
  font-size: 14px;
  text-align: center;
`

const BackLink = styled.a`
  display: block;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-top: 24px;
  text-decoration: none;

  &:hover {
    color: #fff;
  }
`

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data } = await axios.post(`${API_BASE}/api/admin/login`, {
        username,
        password
      })

      // 토큰 저장
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.admin))

      onLogin(data.admin, data.token)
    } catch (err) {
      setError(err.response?.data?.error || '로그인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <LoginBox>
        <Title>Within Admin</Title>
        <Subtitle>관리자 로그인</Subtitle>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <Label>아이디</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoFocus
            />
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
            />
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </Form>

        <BackLink href="/">메인으로 돌아가기</BackLink>
      </LoginBox>
    </Container>
  )
}

export default AdminLogin
