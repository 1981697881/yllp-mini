import api from '@/common/request/index'
import store from '@/common/store'
import router from '@/common/router'
import {
	API_URL
} from '@/env'

export default class Wechat {
	async login() {
		let token = '';
		if (router.$Route.path.indexOf('public/login') == -1) {
			uni.setStorageSync('fromLogin', router.$Route);
		}
		// #ifdef MP-WEIXIN
		store.commit('FORCE_OAUTH', true);
		await this.getWxMiniProgramSessionKey();
		// #endif
		// #ifdef H5
		this.wxOfficialAccountLogin();
		// #endif
		// #ifdef APP-PLUS
		token = await this.wxOpenPlatformLogin();
		return token;
		// #endif
	}
	// #ifdef H5

	wxOfficialAccountLogin() {
		let oUrl = window.location.href;
		window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + store.state.init.initData.wechat.appid +
			`&redirect_uri=${API_URL}user/wxOfficialAccountLogin&response_type=code&scope=snsapi_userinfo&state=` +
			oUrl;
		throw 'stop';
	}
	//临时登录获取OpenId 不入库不绑定用户
	wxOfficialAccountBaseLogin() {
		let oUrl = window.location.href;
		//首次进入 没有登录 保存
		window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + store.state.init.initData.wechat.appid +
			`&redirect_uri=${API_URL}user/wxOfficialAccountBaseLogin&response_type=code&scope=snsapi_base&state=` +
			oUrl;
		throw 'stop';
	}
	// #endif

	wxOpenPlatformLogin() {
		let that = this;
		return new Promise((resolve, reject) => {
			uni.login({
				provider: 'weixin',
				success: function(loginRes) {
					if (loginRes.errMsg === "login:ok") {
						let authResult = loginRes.authResult;
						uni.getUserProfile({
							provider: 'weixin',
							success: function(infoRes) {
								if (infoRes.errMsg === "getUserProfile:ok") {
									let userInfo = infoRes.userInfo;
									api('user.wxOpenPlatformLogin', {
										authResult: authResult,
										userInfo: userInfo
									}).then(res => {
										if (res.code === 1) {
											resolve(res.data.token);
										}
									});
								}
							},
							fail: function(res) {
								api('dev.debug', {
									info: res
								})
							}
						});
					}
				},
				fail: function(res) {
					api('dev.debug', {
						info: res
					})
				}
			});
		});
	}

	// #ifdef MP-WEIXIN
	async getWxMiniProgramSessionKey() {
		let that = this;
		let sessionStatus = false;
		let session_key = '';
		return new Promise((resolve, reject) => {
			uni.checkSession({
				success(res) {
					if (res.errMsg === 'checkSession:ok') sessionStatus = true;
				},
				complete() {
					/* 	 */
						uni.login({
							success: function(info) {
								let code = info.code;
								api('user.getWxMiniProgramSessionKey', {
									code: code,
								}).then(res => {
									console.log("授权")
									if (res.flag) {
										uni.setStorageSync('session_key', res.data.session_key);
										uni.setStorageSync('openid', res.data.openid);
										uni.setStorageSync('token', res.data.token);
										session_key = res.data.session_key;
										store.dispatch('getUserInfo')
									}
								});
							}
						});
					/* } else {
						session_key = uni.getStorageSync('session_key');
					} */
				}
			})

			resolve(session_key);

		});
	}

	wxMiniProgramLogin(e) {
		let that = this;
		console.log(e)
		return new Promise((resolve, reject) => {
			if (!uni.getStorageSync('session_key')) {
				uni.showToast({
					title: '未获取到session_key,请重启应用',
					icon: 'none'
				})
				that.getWxMiniProgramSessionKey();
				return;
			}
			if (e.errMsg === "getUserProfile:ok") {
				api('user.wxMiniProgramLogin', {
					sessionKey: uni.getStorageSync('session_key'),
					openid: uni.getStorageSync('openid'),
					encryptedData: e.encryptedData,
					iv: e.iv,
					signature: e.signature
				}).then(res => {
					console.log(res)
					if (res.flag) {
						resolve(res.data);
					}
				});
			}
		});
	}

	// 小程序更新
	checkMiniProgramUpdate() {
		if (uni.canIUse('getUpdateManager')) {
			const updateManager = uni.getUpdateManager()
			updateManager.onCheckForUpdate(function(res) {
				// 请求完新版本信息的回调
				if (res.hasUpdate) {
					updateManager.onUpdateReady(function() {
						uni.showModal({
							title: '更新提示',
							content: '新版本已经准备好，是否重启应用？',
							success: function(res) {
								console.log('success====', res)
								// res: {errMsg: "showModal: ok", cancel: false, confirm: true}
								if (res.confirm) {
									// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
									updateManager.applyUpdate()
								}
							}
						})
					})
					updateManager.onUpdateFailed(function() {
						// 新的版本下载失败
						uni.showModal({
							title: '已经有新版本了哟~',
							content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
						})
					})
				}
			})
		}
	}
	// #endif


}
