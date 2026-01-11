import { Component } from 'react'
import styled from 'styled-components'

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 20px;
  text-align: center;
`

const ErrorIcon = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
`

const ErrorTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 12px;
  color: #ff6b6b;
`

const ErrorMessage = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
  max-width: 500px;
  line-height: 1.6;
`

const ErrorDetails = styled.details`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  max-width: 600px;
  width: 100%;
  text-align: left;

  summary {
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
  }

  pre {
    font-size: 12px;
    color: #ff6b6b;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    border: none;
    color: #fff;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    }
  ` : `
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleClearData = () => {
    if (window.confirm('모든 로컬 데이터를 초기화하시겠습니까? 저장된 진행상황이 삭제됩니다.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>🌍💔</ErrorIcon>
          <ErrorTitle>앗! 문제가 발생했습니다</ErrorTitle>
          <ErrorMessage>
            예기치 않은 오류가 발생했습니다.
            페이지를 새로고침하거나, 문제가 지속되면 데이터를 초기화해 보세요.
          </ErrorMessage>

          <ErrorDetails>
            <summary>오류 상세 정보</summary>
            <pre>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </ErrorDetails>

          <ButtonGroup>
            <Button onClick={this.handleGoHome}>
              홈으로
            </Button>
            <Button $primary onClick={this.handleReload}>
              새로고침
            </Button>
            <Button onClick={this.handleClearData}>
              데이터 초기화
            </Button>
          </ButtonGroup>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
