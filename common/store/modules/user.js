// 用户数据模块
import api from '@/common/request/index'
import store from '@/common/store'
import router from '@/common/router.js'
import tools from '@/common/utils/tools'

import {
	USER_INFO,
	LOGIN_TIP,
	BAL_INFO,
	ORDER_NUMBER,
	MESSAGE_IDS,
	STORE_INFO,
	OUT_LOGIN,
	// #ifdef MP-WEIXIN
	FORCE_OAUTH,
	// #endif
} from '../types.js'
const state = {
	userInfo: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo') : [],
	showLoginTip: false,
	orderNum: {},
	balInfo: uni.getStorageSync('balInfo'),
	storeInfo: {},
	// #ifdef MP-WEIXIN
	forceOauth: false,
	// #endif
	messageIds: {}, //小程序订阅消息模板ids

}

const actions = {
	//设置token并返回上次页面
	setTokenAndBack({
		commit
	}, token) {
		uni.setStorageSync('token', token);
		store.dispatch('getUserDetails');
		let fromLogin = uni.getStorageSync('fromLogin');
		if (fromLogin) {
			tools.routerTo(fromLogin.path, fromLogin.query, true);
			uni.removeStorageSync('fromLogin')
		} else {
			//默认跳转首页S
			router.replaceAll('/pages/index/index')
		}
	},

	// 获取用户信息
	getUserInfo({
		commit
	}) {
		return new Promise((resolve, reject) => {
			let params = {
				data:{
					"FilterString": "FDocumentStatus ='C' and FOpenID ='"+uni.getStorageSync('openid')+"'",
					"FormId": "QDEP_Cust_ShopEmp",
					"OrderString": "FCreateTime ASC",
					"FieldKeys": "FEmpNo,FEmpName,FIsManage,FID,FOpenID,FEntity_FEntryID,FCustID.FNUMBER,FIsRec,FIsView",
				}
			}
			api('executeBillQueryAuth', params,1).then(userRes => {
				console.log(userRes)
				let userReso = userRes[0];
				if (userRes.length>0) {
					commit('LOGIN_TIP', false);
					commit('USER_INFO', userReso);
					uni.setStorageSync('userInfo', userReso);
				}else{
					if(userRes.length==0){
						commit('LOGIN_TIP', true);
						commit('USER_INFO', []);
						uni.removeStorageSync('userInfo');
					}
					uni.showToast({
						icon: 'none',
						title: userReso[0]['Result']['ResponseStatus']['Errors'][0]['Message']
					})
				}
			});
		})
	},
	// 获取用户信息-普通
	getUserDetails({
		commit
	}) {
		return new Promise((resolve, reject) => {
			api('user.member',{openId: uni.getStorageSync('openid')}).then(res => {
				if(res.flag){
					commit('LOGIN_TIP', false);
					commit('USER_INFO', res.data);
					uni.setStorageSync('userInfo', res.data);
				}else{
					commit('LOGIN_TIP', true);
				}
				resolve(res)
			}).catch(e => {
				reject(e)
			})
		})
	},// 获取用户余额
	getUserBalance({
		commit
	}) {
		return new Promise((resolve, reject) => {
			/* phone: state.userInfo.phoneNumber */
			api('user.balance2',{placeId: state.storeInfo.v8PlaceId,V8Url: state.storeInfo.v8Url,WechatId: state.userInfo.wechatId,PublicOpenID:state.userInfo.publicOpenId}).then(res => {
				if(res.flag){
					commit('BAL_INFO', res.data[0]);
					uni.setStorageSync('balInfo', res.data[0]);
				}else{
					commit('BAL_INFO', {});
					uni.setStorageSync('balInfo', {});
				}
				resolve(res)
			}).catch(e => {
				commit('BAL_INFO', {});
				uni.setStorageSync('balInfo', {});
				reject(e)
			})
		})
	},
	// 订单信息
	getOrderNum({
		commit
	}) {
		return new Promise((resolve, reject) => {
			api('order.statusNum').then(res => {
				commit('ORDER_NUMBER', res.data);
				resolve(res)
			}).catch(e => {
				reject(e)
			})
		})
	},
	// 获取订阅消息模板ids;
	getMessageIds({
		commit
	}, type) {
		return new Promise((resolve, reject) => {
			api('messageIds').then(res => {
				commit('MESSAGE_IDS', res.data);
				let typeName = []; //模板键
				let obj = res.data; //模板对象
				let arr = []; //模板ids
				switch (type) {
					case 'result': //支付成功后
						typeName = ['order_sended']
						break;
					case 'grouponResult': //拼团支付成功后
						typeName = ['groupon_success', 'groupon_fail', 'order_sended']
						break;
					case 'aftersale': //点击售后
						typeName = ['refund_agree', 'aftersale_change', 'wallet_change']
						break;
					case 'wallet': //提现提醒
						typeName = ['score_change', 'wallet_apply', 'wallet_change']
						break;
					case 'store': //门店新订单通知
						typeName = ['store_order_new']
						break;
					default:
						typeName = []
						break;
				}
				typeName.forEach(item => {
					obj[item] && arr.push(obj[item])
				})
				arr.length && uni.requestSubscribeMessage({
					tmplIds: arr,
					success: (res) => {
						console.log(res);
					},
					fail: (err) => {
						console.log(err);
					}

				});
				resolve(res)
			}).catch(e => {
				reject(e)
			})
		})
	},
}

const mutations = {
	// 小程序订阅消息模板ids
	[MESSAGE_IDS](state, data) {
		state.messageIds = data
	},
	[USER_INFO](state, data) {
		state.userInfo = data
	},[BAL_INFO](state, data) {
		state.balInfo = data
	},[STORE_INFO](state, data) {
		state.storeInfo = data
	},
	[LOGIN_TIP](state, data) {
		state.showLoginTip = data
	},
	[ORDER_NUMBER](state, data) {
		state.orderNum = data
	},
	// #ifdef MP-WEIXIN
	[FORCE_OAUTH](state, data) {
		state.forceOauth = data
		data ? uni.hideTabBar() : uni.showTabBar();
	},
	// #endif

	[OUT_LOGIN](state, data) {
		uni.removeStorageSync('token');
		uni.removeStorageSync('userInfo');
		uni.removeStorageSync('storeInfo');
		uni.removeStorageSync('cartNum');
		store.commit('USER_INFO', []);
		store.commit('CART_LIST', []);
		store.commit('CART_NUM');
		store.commit('ORDER_NUMBER', {});
	},

}

const getters = {

}

export default {
	state,
	mutations,
	actions,
	getters
}
