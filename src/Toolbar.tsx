import React from 'react';
import { Toolbar, ToolbarRow, ToolbarSection, ToolbarTitle } from '@rmwc/toolbar';
import './Toolbar.css';

const Tbar: React.FC<{title:string}> = ({title}) => {
  return (
    <Toolbar>
      <ToolbarRow>
        <ToolbarSection alignStart >
          <ToolbarTitle>{title}</ToolbarTitle>
        </ToolbarSection>
          <ToolbarSection alignEnd >
          </ToolbarSection>
        </ToolbarRow>
    </Toolbar>
        );
  }
      
export default Tbar;