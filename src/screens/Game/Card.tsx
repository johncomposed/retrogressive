import React, {FC, useState} from 'react'
import cx from 'clsx';

export type HelloWorldProps = {
  name?: string
};

export const HelloWorld: FC<HelloWorldProps> = ({name="💀"}) => {
  const [clicked, setClicked] = useState(false)

  return (
    <div>
      <span onClick={()=> setClicked(c => !c)} className={cx({
        "text-blue-600": !clicked,
        "text-green-600": clicked
      }, "underline cursor-pointer")}>
        Hello {name}!
      </span>
    </div>
  )
};

export default HelloWorld;