/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Paper } from '../Paper/Paper.base';
import { PaperEventType } from '../Paper/Paper.types';
import { PaperEventData, PaperEventProperties, PaperEventTarget } from './PaperEvent.types';

export class PaperEvent<T> {
  public canPropagate: boolean;

  private _eventType: PaperEventType | string;
  private _paper: Paper;

  private _target: PaperEventTarget<T>;
  private _data: PaperEventData<T>;
  private _defaultAction: ((data: PaperEventData<T>) => void) | undefined;

  constructor(eventType: PaperEventType | string, paper: Paper, paperEventProperties?: PaperEventProperties<T>) {
    // @ts-ignore
    const { target, data, defaultAction } = paperEventProperties || {};

    this.canPropagate = true;

    this._eventType = eventType;
    this._paper = paper;

    this._target = target;
    this._data = data;
    this._defaultAction = defaultAction;
  }

  /**
   * Get the paper event type string.
   */
  get eventType(): PaperEventType | string {
    return this._eventType;
  }

  /**
   * Get a reference to the paper instance that created the event. This is
   * useful for calling any paper methods from the listeners.
   */
  get paper(): Paper {
    return this._paper;
  }

  /**
   * Get the target of the event. In many cases this will be the item that
   * will be actioned on by the default action once all listeners have run.
   * This can be done early by calling defaultAction, and can be prevented
   * permanently by calling preventDefault.
   */
  get target(): PaperEventTarget<T> {
    return this._target;
  }

  /**
   * Get the data object. This contains any other data specific to the event.
   */
  get data(): PaperEventData<T> {
    return this._data;
  }

  /**
   * Invokes the default action related to the event. This is usually called
   * after all listeners have been run, and can only be called once. Calling
   * it using this method will prevent it from being fired after listeners
   * have run. Ensure that no other listeners need to act before the default
   * action is invoked.
   */
  public defaultAction(): void {
    if (this._defaultAction) this._defaultAction(this._data);
    this._defaultAction = undefined;
  }

  /**
   * Prevents the default action from being invoked by removing it from the
   * event. This is permanent, so only use if you wish to completely prevent
   * the default action.
   */
  public preventDefault(): void {
    this._defaultAction = undefined;
  }

  /**
   * Prevents the event from propagating any further. This will prevent any
   * other listeners from receiving the event. The default action will still
   * be fired after all listeners have completed unless it was already called
   * or preventDefault is called separately.
   */
  public stopPropagation(): void {
    this.canPropagate = false;
  }
}
