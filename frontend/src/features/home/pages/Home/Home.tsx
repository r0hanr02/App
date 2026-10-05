
import { useStore } from '../../../../store/store';

const Home = () => {
  console.log(useStore.getState().data)
  return (
    <div>Home</div>
  )
}

export default Home