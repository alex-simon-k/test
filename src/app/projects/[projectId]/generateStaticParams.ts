import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

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