import { useModeRef } from "../../utils/hooks/map/useContextRef"
import { getMapModeComponent } from "./strategy";

const Home = () => {
  const { mode } = useModeRef();
  const Component = getMapModeComponent(mode);

  return (
    <Component />
  )
}

export default Home;