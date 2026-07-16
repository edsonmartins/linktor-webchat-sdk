import { NgModule } from '@angular/core'
import { LinktorChatComponent } from './linktor-chat.component'

// LinktorChatComponent is standalone; the module simply re-exports it so both
// styles work: `imports: [LinktorChatComponent]` or `imports: [LinktorWebChatModule]`.
@NgModule({
  imports: [LinktorChatComponent],
  exports: [LinktorChatComponent],
})
export class LinktorWebChatModule {}
