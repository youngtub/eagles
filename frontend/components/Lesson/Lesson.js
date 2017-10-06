import React from 'react';
import LessonSlideListEntry from './LessonSlideListEntry.js';
import Slide from './Slide.js';
import { Button, Grid, Row } from 'react-bootstrap';


class Lesson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      specificLesson: {},
      slides: [],
      currentSlide: null,
      index: 0,
      videoIdOfClickedOnVideo: '',
      liked: false,
      unlockQuiz: false
    }
  }

  componentDidMount() {
     return fetch('/lesson/' + this.props.match.params.id, { method: 'GET', credentials: "include" })
      .then((response) => response.json())
      .then((lessonDataJSON) => {
        console.log('LESSON DATA', lessonDataJSON);
        this.setState({
          specificLesson: lessonDataJSON
        })
        var slidesForLesson = lessonDataJSON.slides;
        var lessonRef = lessonDataJSON._id;
        //do it with lessonRef instead, change findSLides route
        var allSlideObjsForLesson = [];

          var objForMongo = {
            lessonRef: lessonRef
          }
          return fetch('/findslides', {
            method: "POST",
            body: JSON.stringify(objForMongo),
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include"
          })
          .then( (data) => data.json())
          .then( (JSONdata) => {
            // console.log('response from slides', JSONdata)
            allSlideObjsForLesson = allSlideObjsForLesson.concat(JSONdata)
            console.log('allSlideObjsForLesson', allSlideObjsForLesson)
            this.setState({
              slides: allSlideObjsForLesson
            }, () => console.log('state mount cb', this.state));
          })

      })
      .then( () => {
          console.log('Role going into lesson', this.props.role);
          if (this.props.role === 'student') {
            this.setState({
              currentSlide: this.state.slides[0]
            }, () => console.log('students first slide', this.state.currentSlide))
          }
        })
  }

  onLessonSlideListEntryClick(index) {

    var videoIdInUrl = this.state.slides[index].youTubeUrl;
    var sliceFrom = videoIdInUrl.indexOf('=');
    var videoId = videoIdInUrl.slice(sliceFrom + 1);
    this.setState({
      currentSlide: this.state.slides[index],
      index: index,
      videoIdOfClickedOnVideo: videoId
    });
  }

  exit() {
    this.setState({
      currentSlide: null,
      index: 0
    });
  }

  goToQuiz() {

  }

  previousSlideClick(index) {
    index--;
    if (index < 0) {
      alert("There is no previous slide! You will be redirected to the Lesson Home Page.");
      this.exit();
    } else {
      this.setState({
        index: index
      });
      this.onLessonSlideListEntryClick(index);
    }
  }

  nextSlideClick(index) {
    index++;
    if (index === this.state.slides.length) {
      // alert('You\'ve made it to the end of the lesson.')
      // this.exit();
      this.setState({
        index: index,
        unlockQuiz: true
      })
    } else {
      this.setState({
        index: index
      });
      this.onLessonSlideListEntryClick(index);
    }
  }

  renderVideo(thereIsAVideo) {
    if (thereIsAVideo) {
      return <iframe style={{width: 500, height: 350, float: "left"}} className="youtubeVideo" src={'https://www.youtube.com/embed/' + thereIsAVideo} allowFullScreen></iframe>
    }
  }

  likeALesson() {
    this.state.specificLesson.likes++;
    var body = { likes: this.state.specificLesson.likes, lessonid: this.state.specificLesson._id, fromLike: true };
    fetch('/lessons', {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
    .then(function(result) {
      return result.json();
    })
    .then((likeCheck) => {
      if (this.state.specificLesson.likes - 1 === likeCheck.likes) {
        this.state.specificLesson.likes = likeCheck.likes;
        alert("You've already liked this lesson.");
      } else {
        alert("You've liked this video and it has been added to your favorites!")
        console.log(this.state.specificLesson);
      }
    })
    .catch(function(err) {
      console.log(err);
    })
  };

  addToClass(e) {

  }

  render() {
    return (
      <div>
        { this.state.currentSlide !== null ? (
          <Slide
          slideData={this.state.currentSlide}
          videoIdOfClickedOnVideo={this.state.videoIdOfClickedOnVideo}
          renderVideo={this.renderVideo(this.state.videoIdOfClickedOnVideo)}
          previousSlideClick={this.previousSlideClick.bind(this)}
          nextSlideClick={this.nextSlideClick.bind(this)}
          exitClick={this.exit.bind(this)}
          index={this.state.index}
          totalLength={this.state.slides.length}
          role={this.props.role}
          complete={this.state.unlockQuiz}
          goToQuiz={this.goToQuiz.bind(this)}
          />
        ) : (
          <div className="lessonSlideList">
            <div className="lesson">
              <h1 className="lessonTitle">{this.state.specificLesson.name}</h1>
              <p className="lessonDescription">{this.state.specificLesson.description}</p>
              <Grid>
                <Row>
                {this.state.slides.map((slide, i) => (
                  <LessonSlideListEntry
                    slide={slide}
                    index={i}
                    key={i}
                    onLessonSlideListEntryClick={this.onLessonSlideListEntryClick.bind(this)}
                  />
                ))}
                </Row>
              </Grid>
            </div>
            <Button type="button" onClick={this.likeALesson.bind(this)}>Like</Button>
          </div>
        )}
      </div>
    );
  }
}


export default Lesson;
