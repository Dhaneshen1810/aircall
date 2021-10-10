import React from 'react';
import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import moment from 'moment';

import Header from './Header.jsx';
import Modal from  'react-bootstrap/Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [activities, setActivities] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [disableBtn, setDisableBtn] = useState(false);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    getActivities();
  }, [])

  function filterByDate(activityArray) {
    let dates = {}

    for (let activity of activityArray) {
      const date = moment(activity).format('MMMM, DD YYYY');
      if (!dates[date]) {
        dates[date] = [activity];
      }
      else {
        dates[date].push(activity);
      }
    }

    let datesArr = []
    for (let key in dates) {
      datesArr.push([key, dates[key]])
    }

    return datesArr;
  }

  function getActivities() {
    Axios.get('https://aircall-job.herokuapp.com/activities')
    .then((res) => {
      setActivities(filterByDate(res.data));
    })
    .catch((err) => {
      console.log(err)
    })
  }

  function updateActivity(activityId, toArchive) {
    Axios.post('https://aircall-job.herokuapp.com/activities/' + activityId, {
      is_archived: toArchive
    })
    .then((res) => {
      toast.success('Activity successfully updated.');
      getActivities();
    })
    .catch((err) => {
      console.log(err)
      toast.error('Failed to update activity.')
    })

    handleClose();
    setDisableBtn(false);
    setSelectedActivity(null);
  }

  return (
    <div className='container'>
      <Header/>
      <div className="container-view">
        {
          activities === null ? <div>Loading</div> : 
          activities.map(data => {
            return(
              <div key={data}>
                <div className="flexRow dateSection">
                  {data[0]}
                </div>
                {
                  data[1].map(activity => {
                    return (
                      <div key={activity.id} className="activity flexRow" onClick={() => {setSelectedActivity(activity); handleShow()}}>
                        <div className="leftSection">
                          <img src={activity.direction === "outbound" ? "/public/outgoing-call.png" : "/public/incoming-call.png"}/>
                        </div>
                        <div className="middleSection flexColumn">
                          <div className="flexRow textTo">{activity.to === null ? '(Info missing)' : activity.to}</div>
                          <div className="flexRow textFrom">tried to call on {activity.from}</div>
                        </div>
                        <div className="rightSection flexColumn">
                          <div className="timeBox">
                            {moment(new Date(activity.created_at)).format('hh:mm a').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
              )
          })
        }
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Activity Id: {selectedActivity != null && selectedActivity.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flexColumn">
            <div className="flexRow justifyBetween">
              <div>Call type: <b>{selectedActivity != null && selectedActivity.call_type.toUpperCase()}</b></div>
              <div>Create at: <b>{selectedActivity != null &&moment(new Date(selectedActivity.created_at)).format('hh:mm a').toUpperCase()}</b></div>
            </div>
            <div className="flexRow justifyBetween">
              <div>From: <b>{selectedActivity != null && selectedActivity.from}</b></div>
              <div>To: <b>{selectedActivity != null && selectedActivity.to}</b></div>
            </div>
            <div className="flexRow justifyBetween">
              <div>Direction: <b>{selectedActivity != null && selectedActivity.direction}</b></div>
              <div>Via: <b>{selectedActivity != null && selectedActivity.via}</b></div>
            </div>
            <div className="flexRow justifyBetween">
              <div>Duration: <b>{selectedActivity != null && selectedActivity.duration}</b></div>
              <div>{selectedActivity != null && selectedActivity.is_archived ? 
                <div className="flexRow alignCenter" style={{height:'20px'}}>
                  <b>ARCHIVED</b>
                </div> :
                <div className="flexRow alignCenter" style={{height:'20px'}}>
                  <b>UNARCHIVED</b>
              </div> 
                }</div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => {setSelectedActivity(null); handleClose()}}>
            Close
          </button>
          {
            selectedActivity != null && selectedActivity.is_archived ? 
            <button className="btn btn-danger" onClick={() => {setDisableBtn(true); updateActivity(selectedActivity.id, false)}} disabled={disableBtn}>Unarchive</button>
            :
            <button className="btn btn-success" onClick={() => {setDisableBtn(true); updateActivity(selectedActivity.id, true)}} disabled={disableBtn}>Archive</button>
          }
        </Modal.Footer>
      </Modal>
      <ToastContainer/>
    </div>
    );
};

ReactDOM.render(<App/>, document.getElementById('app'));

export default App;
