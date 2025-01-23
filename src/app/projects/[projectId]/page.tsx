import { collection, getDocs, getFirestore } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import ProjectDetailsClient from './page.client'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export async function generateStaticParams() {
  try {
    const projectsRef = collection(db, 'projects')
    const projectsSnap = await getDocs(projectsRef)
    
    return projectsSnap.docs.map(doc => ({
      projectId: doc.id
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default function ProjectDetailsPage() {
  return <ProjectDetailsClient />
} 