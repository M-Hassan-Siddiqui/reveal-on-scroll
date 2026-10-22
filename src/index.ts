import { destroy, init, refresh, refreshHard } from './core.js';

export type { AnchorPlacement, EasingName, RosEventMap, RosOptions } from './types.js';
export { destroy, init, refresh, refreshHard };

/** All methods on one object. The <script> build exposes it as the `ROS` global: `ROS.init()`. */
const ROS = { init, refresh, refreshHard, destroy };

export default ROS;
