import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FiUsers, FiMapPin, FiActivity, FiLogOut, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Container = styled.div`
  min-height: 100vh;
  background: #0f0f1a;
  color: #fff;
`

const Header = styled.header`
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
`

const Logo = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #4CAF50;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const AdminInfo = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`

const Main = styled.main`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
`

const Tab = styled.button`
  background: ${props => props.$active ? 'rgba(76, 175, 80, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#4CAF50' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  padding: 10px 20px;
  color: ${props => props.$active ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(76, 175, 80, 0.1);
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
`

const StatLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
`

const Section = styled.section`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
`

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;

  input {
    background: transparent;
    border: none;
    color: #fff;
    outline: none;
    width: 200px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
`

const TableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    margin: 0 -20px;
    padding: 0 20px;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;

  th, td {
    text-align: left;
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    white-space: nowrap;
  }

  th {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    font-size: 13px;
  }

  td {
    font-size: 14px;
  }

  tr:hover td {
    background: rgba(255, 255, 255, 0.03);
  }

  @media (max-width: 768px) {
    th, td {
      padding: 10px 8px;
      font-size: 12px;
    }
  }
`

const Badge = styled.span`
  background: ${props => props.$active ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  color: ${props => props.$active ? '#4CAF50' : '#f44336'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
`

const PageButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
`

const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const PopularList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PopularItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
`

const AdminDashboard = ({ admin, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [usersPagination, setUsersPagination] = useState({ page: 1, totalPages: 1 })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const apiCall = async (endpoint, options = {}) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        ...options
      }
      const response = await axios(`${API_BASE}/api/admin${endpoint}`, config)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        onLogout()
        throw new Error('세션이 만료되었습니다')
      }
      throw new Error(error.response?.data?.error || 'API 오류')
    }
  }

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const data = await apiCall('/dashboard')
      setStats(data)
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async (page = 1) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ page, limit: 20 })
      if (searchQuery) params.append('search', searchQuery)
      const data = await apiCall(`/users?${params}`)
      setUsers(data.users)
      setUsersPagination(data.pagination)
    } catch (error) {
      console.error('Users load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard()
    } else if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab])

  const handleSearch = (e) => {
    e.preventDefault()
    loadUsers(1)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Container>
      <Header>
        <Logo>Within Admin</Logo>
        <HeaderRight>
          <AdminInfo>{admin.name} ({admin.role})</AdminInfo>
          <LogoutButton onClick={onLogout}>
            <FiLogOut size={16} />
            로그아웃
          </LogoutButton>
        </HeaderRight>
      </Header>

      <Main>
        <Tabs>
          <Tab $active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
            대시보드
          </Tab>
          <Tab $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            사용자 관리
          </Tab>
        </Tabs>

        {activeTab === 'dashboard' && (
          <>
            <StatsGrid>
              <StatCard>
                <StatLabel><FiUsers size={16} /> 전체 사용자</StatLabel>
                <StatValue>{stats?.stats?.totalUsers || 0}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel><FiActivity size={16} /> 활성 사용자 (7일)</StatLabel>
                <StatValue>{stats?.stats?.activeUsers || 0}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel><FiMapPin size={16} /> 총 방문 기록</StatLabel>
                <StatValue>{stats?.stats?.totalVisits || 0}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel><FiMapPin size={16} /> 등록된 스팟</StatLabel>
                <StatValue>{stats?.stats?.totalSpots || 0}</StatValue>
              </StatCard>
            </StatsGrid>

            <Section>
              <SectionHeader>
                <SectionTitle>인기 스팟 Top 10</SectionTitle>
                <RefreshButton onClick={loadDashboard}>
                  <FiRefreshCw size={16} />
                </RefreshButton>
              </SectionHeader>
              <PopularList>
                {stats?.popularSpots?.length > 0 ? (
                  stats.popularSpots.map((spot, index) => (
                    <PopularItem key={spot.spot_id}>
                      <span>{index + 1}. {spot.spot_name}</span>
                      <Badge $active>{spot.visits} 방문</Badge>
                    </PopularItem>
                  ))
                ) : (
                  <PopularItem>아직 방문 기록이 없습니다</PopularItem>
                )}
              </PopularList>
            </Section>
          </>
        )}

        {activeTab === 'users' && (
          <Section>
            <SectionHeader>
              <SectionTitle>사용자 목록</SectionTitle>
              <form onSubmit={handleSearch}>
                <SearchInput>
                  <FiSearch size={16} color="rgba(255,255,255,0.5)" />
                  <input
                    type="text"
                    placeholder="이름 또는 이메일 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </SearchInput>
              </form>
            </SectionHeader>

            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>레벨</th>
                    <th>스탬프</th>
                    <th>해금</th>
                    <th>가입일</th>
                    <th>마지막 접속</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name || '-'}</td>
                      <td>{user.email}</td>
                      <td>Lv.{user.level || 1}</td>
                      <td>{user.total_stamps || 0}</td>
                      <td>{user.unlocked_count || 0}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>{formatDate(user.last_login_at)}</td>
                      <td>
                        <Badge $active={user.is_active}>
                          {user.is_active ? '활성' : '비활성'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <Pagination>
              <PageButton
                disabled={usersPagination.page <= 1}
                onClick={() => loadUsers(usersPagination.page - 1)}
              >
                <FiChevronLeft size={16} /> 이전
              </PageButton>
              <span>
                {usersPagination.page} / {usersPagination.totalPages}
              </span>
              <PageButton
                disabled={usersPagination.page >= usersPagination.totalPages}
                onClick={() => loadUsers(usersPagination.page + 1)}
              >
                다음 <FiChevronRight size={16} />
              </PageButton>
            </Pagination>
          </Section>
        )}
      </Main>
    </Container>
  )
}

export default AdminDashboard
