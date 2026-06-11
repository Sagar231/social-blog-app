import { Link } from "react-router-dom";
import PostFeed from "../components/PostFeed.jsx";
import { usePostList } from "../hooks/usePosts.js";

export default function Home() {
  const feed = usePostList("/feed");

  return (
    <div className="animate-fade-in">
      <h1 className="mb-5 font-display text-2xl font-bold">Your feed</h1>
      <PostFeed
        query={feed}
        empty={
          <span>
            Your feed is quiet. <Link to="/explore" className="text-accent-blue">Explore</Link>{" "}
            and follow some writers to fill it up.
          </span>
        }
      />
    </div>
  );
}
