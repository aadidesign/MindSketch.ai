import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { auth, onAuthStateChanged, signOut } from "../config/firebase";
export const AppContext = createContext()

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [credit, setCredit] = useState(0);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    
    console.log('Backend URL:', backendUrl);
    console.log('Environment VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);

    const navigate = useNavigate()

    const loadCreditsData = async () => {
        try {
            if (!token) {
                console.log('No token available for credits request');
                return;
            }
            
            console.log('Loading credits from:', `${backendUrl}/api/users/credits`);
            const { data } = await axios.get(
                `${backendUrl}/api/users/credits`,
                { headers: { token } }
            );
            if (data.success) {
                setCredit(data.credits);
                setUser(data.user);
                console.log('Credits loaded successfully:', data.credits);
                
                // Handle billing information
                if (data.billing) {
                    if (data.billing.needsCredits) {
                        toast.warning('You have no credits left. Please purchase a plan to continue.');
                        navigate('/buy');
                    } else if (data.billing.lowCredits) {
                        toast.info(`Low credits (${data.credits}). Consider purchasing more credits.`);
                    }
                }

            } else {
                console.log('Credits request failed:', data.message);
            }
        } catch (error) {
            console.log('Error loading credits:', error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const generateImage = async(prompt) => {
        try{
            const {data} = await axios.post(backendUrl + '/api/image/generate-image', {prompt}, {headers : {token}})
            if(data.success){
                loadCreditsData()
                    return data.resultImage  
            }
        } catch(error){
            const message = error.response?.data?.message || error.message
            toast.error(message)
            loadCreditsData()
            if (error.response?.data?.creditBalance === 0){
                toast.error('Insufficient credits. Please buy a package to continue.')
                navigate('/buy')
            }
            
        }
    }

    // Firebase authentication handler
    const handleFirebaseAuth = async (firebaseUser) => {
        if (firebaseUser) {
            try {
                // Get Firebase token
                const firebaseToken = await firebaseUser.getIdToken();
                
                // Send to backend to verify and create/get user
                const { data } = await axios.post(
                    `${backendUrl}/api/users/firebase-auth`,
                    {
                        firebaseToken,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        photoURL: firebaseUser.photoURL
                    }
                );
                
                if (data.success) {
                    setToken(data.token);
                    setUser(data.user);
                    localStorage.setItem('token', data.token);
                    console.log('Firebase auth successful:', data.user);
                } else {
                    console.error('Backend auth failed:', data.message);
                    toast.error(data.message);
                }
            } catch (error) {
                console.error('Firebase auth error:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    url: `${backendUrl}/api/users/firebase-auth`
                });
                toast.error('Authentication failed: ' + (error.response?.data?.message || error.message));
            }
        } else {
            // User signed out
            setToken('');
            setUser(null);
            setCredit(0);
            localStorage.removeItem('token');
        }
        setAuthLoading(false);
    };

    // Enhanced logout function
    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('token');
            setToken('');
            setUser(null);
            setCredit(0);
            setFirebaseUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
        }
    };

    // Firebase auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log('Firebase auth state changed:', firebaseUser?.email);
            setFirebaseUser(firebaseUser);
            handleFirebaseAuth(firebaseUser);
        });

        return () => unsubscribe();
    }, []);

    // Load credits when token changes
    useEffect(() => {
        if (token && !authLoading) {
            loadCreditsData();
        }
    }, [token, authLoading]);

    const values = {
        user,
        setUser,
        showLogin,
        setShowLogin,
        credit,
        setCredit,
        backendUrl,
        token,
        setToken,
        loadCreditsData,
        logout,
        generateImage,
        firebaseUser,
        authLoading
        }

        return (
            <AppContext.Provider value={values}>
                {props.children}
            </AppContext.Provider>
        )
}

export { AppContextProvider };
