import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from 'react';
import axios from 'axios';

function App() {
  const CLIENT_ID = "5de3ca2f50e947d4a4377071861debef"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPES = "user-read-currently-playing%20user-top-read"

  // declaring first parameter as an empty constant variable and second parameter as a function to update the variable
  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [topArtistsFetched, setTopArtistsFetched] = useState(false);
  const [topTracksFetched, setTopTracksFetched] = useState(false);


  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    // if no token available, but we have a hash, substring the hash at the beginnning
    if(!token && hash){
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
    
      // reset the hash and save the token to localStorage
      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }
    setToken(token)
  }, [])

  // LOGOUT FUNCTION
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  // FETCHING DATA
  const searchArtists = async (e) => {
    e.preventDefault()
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            q: searchKey,
            type: "artist"
        }
    })

    setArtists(data.artists.items)
}

  // FETCH USERS TOP ARTISTS
  const fetchTopArtists = async () => {
    try {
      const { data: topArtistsResponse } = await axios.get(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTopArtists(topArtistsResponse.items);
      setTopArtistsFetched(true); 
    } catch (error){
      console.error("Error fetching top artists:", error);
    }
  };

  // FETCH USERS TOP TRACKS
  const fetchTopTracks = async () => {
    try {
      if(!topTracksFetched){
        const { data: topTracksResponse } = await axios.get(
          "https://api.spotify.com/v1/me/top/tracks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
      setTopTracks(topTracksResponse.items);
      setTopTracksFetched(true);
      }
    } catch (error) {
      console.error("Error fetching top tracks:", error);
    }
  };



  // RENDER SEARCHED ARTIST
  const renderArtists = () => {
    return artists.map(artist => (
        <div key={artist.id}>
            {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> : <div>No Image</div>}
            {artist.name}
        </div>
    ))
  }

  // RENDER TOP ARTISTS
  const renderTopArtists = () => {
    return (
      <div>
        <h2>Top Artists</h2>
        { topArtists.map((artist) => (
          <div key={artist.id}>
            {artist.images.length ? (
              <img width={"10%"} src={artist.images[0].url} alt="" />
            ) : (
              <div>No Image</div>
            )}
            {artist.name}
          </div>
        ))}
      </div>
    );
  };

  // RENDER TOP TRACKS
  const renderTopTracks = () => {
    return (
      <div>
        <h2>Top Tracks</h2>
        {topTracks.map((track) => (
          <div key={track.id}>
            {track.album.images.length ? (
              <img width={"10%"} src={track.album.images[0].url} alt="" />
            ) : (
              <div>No Image</div>
            )}
            {track.name}
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="App">
        <header className="App-header">
            <h1>Wrapped Whenever</h1>
            {!token ? (
                <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}>Login
                    to Spotify</a>
              ) : (
                <button className="logout-button" onClick={logout}>Logout</button>
              )}

                {token ? (
                  <div>
                    <button onClick={() => {
                      if(!topArtistsFetched){
                        fetchTopArtists();
                      }
                      setTopTracksFetched(false); 
                    }}>Fetch Top Artists</button>


                    <button onClick={() => {
                      if(!topTracksFetched){
                        fetchTopTracks();
                      }
                      setTopArtistsFetched(false);
                    }}>Fetch Top Tracks</button>
          
                    {/*only show titles when specific data is fetched*/}
                    {topArtistsFetched && renderTopArtists()}
                    {topTracksFetched && renderTopTracks()}
                  </div>
                ) : (
                  <h2></h2>
                  //<h2>Please Login</h2>
                )}
          
              </header>
            </div>
          );
        }

export default App;
