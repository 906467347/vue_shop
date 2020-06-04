import Vue from 'vue'
import Element, { MessageBox } from 'element-ui'
import { Message } from 'element-ui'

Vue.use(Element)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm