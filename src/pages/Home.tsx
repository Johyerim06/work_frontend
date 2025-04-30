// Home.tsx

import React from 'react';
import SearchSchool from './SearchSchool'; // 위에서 만든거
import SendEmail from './SendEmail'; // 위에서 만든거
// import './Home.css'; // 필요하면 사용

interface HomeState {
  selectedSchool: any | null;
}

class Home extends React.Component<{}, HomeState> {
  state: HomeState = {
    selectedSchool: null,
  };

  handleSelectSchool = (school: any) => {
    this.setState({ selectedSchool: school });
  };

  render() {
    const { selectedSchool } = this.state;

    return (
      <div className="container">
        {/* 학교 검색 부분 */}
        <SearchSchool onSelectSchool={this.handleSelectSchool} />

        {/* 메일 보내기 부분 */}
        <SendEmail selectedSchool={selectedSchool} />
      </div>
    );
  }
}

export default Home;
