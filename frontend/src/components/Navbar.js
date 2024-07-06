import React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
const Navbar = () => {
  const { user, loginWithRedirect, logout } = useAuth0();
  return (
    <div className="fixed top-0 left-0 w-full flex justify-around bg-slate-400 h-16 items-center shadow-md z-50">
      <Link to="/"><b>Home</b></Link>

      {!user && <button onClick={(e)=>{alert("signIn to upload video")}}><b>Upload</b></button>}
      {user && <Link to="/upload"><b>Upload</b></Link>}
      {!user && <button onClick={(e) => { loginWithRedirect() }}><b>Login</b></button>} 
      
      {user && <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}><b>Logout</b></button>}
      {user && <img className="rounded max-w-10" src={user.picture} alt="profile"></img>}  
      
    </div>
  );
};

export default Navbar;
