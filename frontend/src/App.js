import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import Masonry from 'react-masonry-css';
import InfiniteScroll from 'react-infinite-scroller';
import Lazyload from 'react-lazyload';
import {
  Button,
  Col, Row,
  Grid,
  Image,
} from 'react-bootstrap';

import UserList from './components/UserList';
// import Image from './components/Image';

class App extends Component {
  // static getUrlHash = url => url.substring(url.indexOf('#') + 1);

  constructor() {
    super();
    this.loadingImagesCount = 0;
    this.state = {
      viewingIndex: 0,
      viewing: [],
      favs: [],
      users: [],
      selectedUser: null,
      isMouseOnOverImage: false,
      imageUrl: '',
    };
  }

  componentWillMount() {
    try {
      const favs = JSON.parse(localStorage.favs || null) || [];
      if (Array.isArray(favs)) {
        const users = [];
        favs.forEach((tweet) => {
          const userIndex = users.findIndex(user => user.name === tweet.name);
          if (userIndex < 0) {
            users.push({
              name: tweet.name,
              count: 1,
            });
          } else {
            users[userIndex].count += 1;
          }
        });
        users.sort((a, b) => b.count - a.count);
        console.log(users);
        this.setState({ favs, users });
      }
    } catch (e) {
      localStorage.removeItem('favs');
    }

    // this._updateViewer(favs);
    // document.addEventListener('scroll', this._handleScroll);
    // document.addEventListener('keydown', this._handleKeyDown);
  }

  render() {
    // console.log('rendering!');
    return (
      <Grid>
        <Row>
          <Col xs={2}>
            <Row>
              <Button onClick={this._handleClickSyncFavorites}>sync</Button>
              <Button onClick={this._handleClickRemoveLocalStorage}>clear</Button>
            </Row>
            <Row>
              <UserList
                users={this.state.users}
                over={4}
                onClick={this._handleClickUserName}
              />
            </Row>
          </Col>
          <Col xs={10}>
            <InfiniteScroll
              threshold={100}
              loadMore={this._handleLoadMore}
              hasMore={this.state.viewing.length < this.state.favs.length}
              loader={<div key={0}>Loading ...</div>}
            >
              <Masonry
                breakpointCols={{ default: 3 }}
                style={{ display: 'flex' }}
              >
                {this.state.viewing.filter(tweet => (!this.state.selectedUser || tweet.name === this.state.selectedUser)).map(fav => (
                  fav.media.map(item => (
                    <Lazyload key={item} height={300}>
                      <Image
                        responsive
                        src={`https://pbs.twimg.com/media/${item}`}
                        alt={item}
                        key={item}
                        style={{ opacity: 0.05 }}
                      />
                    </Lazyload>
                  ))
                ))}
              </Masonry>
            </InfiniteScroll>
          </Col>
        </Row>
      </Grid>
    );
  }

  _handleClickUserName = (e) => {
    // const selectedUser = App.getUrlHash(window.location.href);
    const selectedUser = e.target.name;
    this.setState({ selectedUser });
  }

  _handleMouseOnOverImage = (e) => {
    this.setState({
      isMouseOnOverImage: true,
      imageUrl: e.target.src,
    });
  }

  _handleMouseOnOutImage = () => {
    this.setState({
      isMouseOnOverImage: false,
    });
  };

  _handleLoadMore = () => {
    console.log('load more!');
    this._updateViewer(this.state.favs);
  }

  _getAllFav = async (params) => {
    const response = await axios.get(`http://localhost:3000/favorites?${queryString.stringify(params)}`);
    const favs = response.data;
    console.log('request success');
    if (favs.length) {
      const maxId = favs[favs.length - 1].id;
      const result = await this._getAllFav({ ...params, max_id: maxId });
      return [...favs, ...result];
    }
    console.log('finish get all favorite tweets');
    return favs;
  };

  _handleClickSyncFavorites = async () => {
    const getFavParams = {
      screen_name: 'og24715',
      count: 200,
      include_entities: false,
    };
    const favs = await this._getAllFav(getFavParams);
    localStorage.setItem('favs', JSON.stringify(favs));
    this.setState({ favs });
    this._updateViewer(favs);
  };

  _handleClickRemoveLocalStorage = () => {
    localStorage.removeItem('favs');
    this.setState({
      favs: [],
      viewing: [],
    });
  }

  _updateViewer = (favs) => {
    this.setState({
      viewing: favs.slice(0, this.state.viewing.length + 10),
    });
  };

  _handleKeyDown = (e) => {
    console.log(e);
    switch (e.code) {
      case 'ArrowDown':
        this.setState({ viewingIndex: this.state.viewingIndex + 1 });
        break;
      case 'ArrowUp':
        this.setState({ viewingIndex: Math.max(0, this.state.viewingIndex - 1) });
        break;
      default:
        break;
    }
  };

  _handleScroll = (e) => {
    console.log(e);
  }
}

export default App;
