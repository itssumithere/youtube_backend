class ApiRespones {
    constructor(
        statuscode ,
        data,
        message= 'success'
    ){
        this.statuscode=statuscode;
        this.data=data;
        this.message=message;
        this.success = true;
    }

} 

export { ApiRespones }