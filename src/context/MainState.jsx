import  { useState } from 'react'
import { MainContext } from './Context';
import ApiService from '../apiservice/ApiService';

const MainState = (props) => {

  const [mainData, setMainData] = useState('Deepak')
  const [locations, setLocations] = useState([])

  const getLocations = async () => {
    try {
      const response = await ApiService.get('states-cities/')
      setLocations(response.data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const [contactData, setContactData] = useState([]);
  const fetchAllExistingContacts = async () => {
    try {
      const response = await ApiService.get('check-existing-contacts/')
      
      setContactData(response.data);
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  return (
    <MainContext.Provider value={{ mainData, setMainData, locations, getLocations, contactData, fetchAllExistingContacts }}>
      {props.children}
    </MainContext.Provider>
  )
}

export default MainState
