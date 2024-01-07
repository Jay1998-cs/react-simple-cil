import React, { Suspense, lazy } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { ConfigProvider, Button, theme } from "antd";

// import Home from "./pages/Home";
// import Game from "./pages/Game";

// 使用懒加载
const Home = lazy(() => import(/* webpackChunkName: 'home' */ "./pages/Home"));
const Game = lazy(() => import(/* webpackChunkName: 'game' */ "./pages/Game"));

const App = () => {
  const btnClickHandler = (e) => {
    alert("hi ");
  };

  return (
    <div>
      <ConfigProvider
        theme={{
          token: { colorPrimary: "#00b48b" },
          algorithm: theme.darkAlgorithm,
        }}
      >
        <h1>App</h1>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/game">Game</Link>
          </li>
        </ul>

        <Suspense fallback={<div>loading...</div>}>
          <Routes>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/game" element={<Game />}></Route>
          </Routes>
        </Suspense>

        <Button type="primary" onClick={btnClickHandler}>
          按钮1
        </Button>

        <ConfigProvider theme={{ token: { colorPrimary: "#bcbcbc" } }}>
          <Button type="primary" onClick={btnClickHandler}>
            按钮2
          </Button>
        </ConfigProvider>
      </ConfigProvider>
    </div>
  );
};

export default App;
