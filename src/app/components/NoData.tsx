

interface NoDataProps {
    message: string;
    description?: string;
}

const NoData= ({message, description}: NoDataProps)=>{

    return(
        <div className="flex flex-col items-center justify-center py-16 text-center" >
            <h2 className="mb-2 text-2xl font-semibold" >{message}</h2>
            {description && <p className="text-muted-foreground">{description}</p>}
        </div>
    );


};

export default NoData;