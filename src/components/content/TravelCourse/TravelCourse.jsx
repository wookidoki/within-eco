import { FiClock, FiMapPin, FiNavigation } from 'react-icons/fi'
import { travelCourses, ecoSpots, CATEGORIES, REGIONS } from '../../../data/spots'
import {
  CourseCard,
  CourseHeader,
  CourseThumbnail,
  CourseInfo,
  CourseName,
  CourseDescription,
  CourseMeta,
  MetaTag,
  SpotPreview,
  SpotDot,
  MoreSpots,
  CourseList,
  ListHeader,
  ListTitle,
} from './TravelCourse.styles'

const TravelCourseCard = ({ course, onClick }) => {
  const region = REGIONS[course.region]

  // 코스에 포함된 스팟들 가져오기
  const courseSpots = course.spots
    .map(spotId => ecoSpots.find(s => s.id === spotId))
    .filter(Boolean)

  return (
    <CourseCard onClick={() => onClick?.(course)}>
      <CourseHeader>
        <CourseThumbnail>{course.thumbnail}</CourseThumbnail>
        <CourseInfo>
          <CourseName>{course.name}</CourseName>
          <CourseDescription>{course.description}</CourseDescription>
        </CourseInfo>
      </CourseHeader>

      <SpotPreview>
        {courseSpots.slice(0, 4).map((spot) => {
          const category = CATEGORIES[spot.category]
          return (
            <SpotDot key={spot.id} $color={category.color}>
              {spot.thumbnail}
            </SpotDot>
          )
        })}
        {courseSpots.length > 4 && (
          <MoreSpots>+{courseSpots.length - 4}곳</MoreSpots>
        )}
      </SpotPreview>

      <CourseMeta>
        <MetaTag>
          <FiMapPin />
          {region?.name}
        </MetaTag>
        <MetaTag>
          <FiClock />
          {course.duration}
        </MetaTag>
        <MetaTag>
          <FiNavigation />
          {course.totalDistance}
        </MetaTag>
        <MetaTag>
          {course.difficulty === 'easy' ? '🌱 쉬움' : course.difficulty === 'medium' ? '🌿 보통' : '🌳 어려움'}
        </MetaTag>
      </CourseMeta>
    </CourseCard>
  )
}

const TravelCourseList = ({ onSelectCourse }) => {
  return (
    <div>
      <ListHeader>
        <ListTitle>🗺️ 추천 여행 코스</ListTitle>
      </ListHeader>
      <CourseList>
        {travelCourses.map((course) => (
          <TravelCourseCard
            key={course.id}
            course={course}
            onClick={onSelectCourse}
          />
        ))}
      </CourseList>
    </div>
  )
}

export { TravelCourseCard, TravelCourseList }
export default TravelCourseList
