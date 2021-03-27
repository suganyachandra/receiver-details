import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity,Image } from 'react-native';
import { Card, Header, Icon } from 'react-native-elements';
import db from '../config';
import firebase from 'firebase';
import { RFValue } from "react-native-responsive-fontsize";



export default class RecieverDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            userID: firebase.auth().currentUser.email,
            userName: "",
            receiverID: this.props.navigation.getParam("details")["userID"],
            requestID: this.props.navigation.getParam("details")["requestID"],
            bookName: this.props.navigation.getParam("details")["bookName"],
            bookImage: "#",
            reasonToRequest: this.props.navigation.getParam("details")["reasonToRequest"],
            receiverName: "",
            receiverContact: "",
            receiverAddress: "",
            receiverRequestDocID: ""
        }
    }

    componentDidMount() {
        this.getReceiverDetails();
        this.getCurrentUserDetails(this.state.userID);
    }

    render() {
        return(
            <View style={{ flex: 1 }}>
            <View style={{ flex: 0.1 }}>
              <Header
                leftComponent={
                  <Icon
                    name="arrow-left"
                    type="feather"
                    color="#ffffff"
                    onPress={() => this.props.navigation.goBack()}
                  />
                }
                centerComponent={{
                  text: "Donate Books",
                  style: {
                    color: "#ffffff",
                    fontSize: RFValue(20),
                    fontWeight: "bold",
                  },
                }}
                backgroundColor="#32867d"
              />
            </View>
            <View style={{ flex: 0.9 }}>
              <View
                style={{
                  flex: 0.3,
                  flexDirection: "row",
                  paddingTop: RFValue(30),
                  paddingLeft: RFValue(10),
                }}
              >
                <View style={{ flex: 0.4,}}>
                  <Image
                    source={{ uri: this.state.bookImage }}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "contain",
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 0.6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: RFValue(25),
                      textAlign: "center",
                      alignItems:"center",
                      justifyContent: "center",
                    }}
                  >
                    {this.state.bookName}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "400",
                      fontSize: RFValue(15),
                      textAlign: "center",
                      marginTop: RFValue(15),
                      alignItems:"center",
                      justifyContent: "center",
                    }}
                  >
                    {this.state.reasonToRequest}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 0.7,
                  padding: RFValue(20),
                }}
              >
                <View style={{ flex: 0.7 ,justifyContent:'center',alignItems:'center',
                marginTop:RFValue(50),borderWidth:1,borderColor:'#deeedd',padding:RFValue(10)}}>
                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: RFValue(30),
                    }}
                  >
                    Reciever Information
                  </Text>
                  <Text
                    style={{
                      fontWeight: "400",
                      fontSize: RFValue(20),
                      marginTop: RFValue(30),
                    }}
                  >
                    Name : {this.state.receiverName}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "400",
                      fontSize: RFValue(20),
                      marginTop: RFValue(30),
                    }}
                  >
                    Contact: {this.state.receiverContact}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "400",
                      fontSize: RFValue(20),
                      marginTop: RFValue(30),
                    }}
                  >
                    Address: {this.state.receiverAddress}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 0.3,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {this.state.receiverID  !== this.state.userID  ? (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        this.updateBookStatus();
                        this.addNotif();
                        this.props.navigation.navigate("My_Donations");
                      }}
                    >
                      <Text>I want to Donate</Text>
                    </TouchableOpacity>
                  ) : console.log("Can't Donate to Yourself")}
                </View>
              </View>
            </View>
          </View>
        )
    }

    updateBookStatus = () => {
        db.collection('book_donations').add({
            bookName: this.state.bookName, 
            requestID: this.state.requestID,
            requestedBy: this.state.receiverName,
            donorID: this.state.userID,
            requestStatus: "Donor Interested"
        })
    }

    getReceiverDetails() {
        db.collection('users').where("email", "==", this.state.receiverID).get().
        then((snapshot) => {
            snapshot.forEach((doc) => {
                this.setState({
                    receiverName: doc.data().firstName,
                    receiverContact: doc.data().phoneNum,
                    receiverAddress: doc.data().address,
                })
            })
        });
        db.collection("requested_books")
        .where("requestID", "==", this.state.requestID)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            this.setState({
                
                receiverRequestDocID: doc.id,
              bookImage: doc.data().image_link,
            });
          });
        });

    }

    getCurrentUserDetails = (userID) => {
        db.collection('users').where("email", "==", userID).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                this.setState({
                    userName: doc.data().firstName + " " + doc.data().lastName
                })
            })
        });
    }
    
    addNotif = () => {
        let message =  "This User Has Shown Interest in Donating A Book: "+ this.state.userName
        db.collection('all_notifs').add({
            targetUserID: this.state.receiverID,
            donorID: this.state.userID,
            requestID: this.state.requestID,
            bookName: this.state.bookName, 
            dateofNotif: firebase.firestore.FieldValue.serverTimestamp(),
            notifStatus:"unread",
            message: message
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonContainer: {
        flex: 0.3,
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        width: 200,
        height: 30,
        alignItems: "center", 
        justifyContent: 'center',
        backgroundColor:"#90A5A9",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.30,
        shadowRadius: 10.32,
        elevation: 16
    }
});