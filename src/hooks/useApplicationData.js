import { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";

export default function useVisualMode(initial) {
  //a custom hook
  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:8001/api/days"),
      axios.get("http://localhost:8001/api/appointments"),
      axios.get("http://localhost:8001/api/interviewers"),
    ]).then((all) => {
      setState((prev) => ({
        ...prev,
        days: all[0].data,
        appointments: all[1].data,
        interviewers: all[2].data,
      }));
    });
  }, []);

  const setDay = (day) => setState((prev) => ({ ...prev, day }));

  function bookInterview(id, interview) {
    //choosing not to convert to async
    return axios.put(`/api/appointments/${id}`, { interview }).then((res) => {
      const appointment = {
        ...state.appointments[id],
        interview: { ...interview },
      };

      const appointments = {
        ...state.appointments,
        [id]: appointment,
      };
      setState({ ...state, appointments });
    });
  }
  function cancelInterview(id) {
    //choosing not to convert to async
    return axios.delete(`/api/appointments/${id}`).then((res) => {
      const newState = _.cloneDeep(state);

      newState.appointments[id].interview = null;

      setState(newState);
    });
  }

  return { state, setState, setDay, bookInterview, cancelInterview };
}
