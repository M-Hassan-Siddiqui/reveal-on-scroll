// @vitest-environment node
import { expect, it } from 'vitest';
import ROS from '../src/index.js';

it('does nothing on the server, where there is no DOM', () => {
  expect(() => {
    ROS.init();
    ROS.refresh(true);
    ROS.refreshHard();
    ROS.destroy();
  }).not.toThrow();
});
